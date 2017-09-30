import logger from "../logger";
import cheerio from "cheerio";
import schedule from "node-schedule";
import moment from "moment";
import util from "util";
import http from "http";
import toMarkdown from "to-markdown";

class Marmet {
  constructor(client) {
    logger.log("info", "Marmet module initialized successfully");

    this.threads = {};

    schedule.scheduleJob("0 0 * * *", () => this.marmetForumsUpdate.bind(this));

    client.on("message", (msg) => {
      if (msg.content == "!marmetforums") {
        this.marmetForumsUpdate();
      }
    });

    this.marmetForumsUpdate();
  }

  marmetForumsUpdate() {
    logger.log("info", "Checking for marmet forums updates...");

    const self = this;

    this._getPage("/forum/city/marmet-wv")
      .then((html) => {
        const $ = cheerio.load(html);
        $(".thread_table tr").each(function() {
          const id = ($(this).attr("id") == null) ? null : $(this).attr("id").replace("threadrow_", "");
          if (id == null) { return; }

          const thread = {
            title: $("a.threadtitle", this).text().trim(),
            last_updated: self._parseUpdateDate($("td.lut", this).text().trim()),
            last_updated_by: $("td.lub", this).text().trim(),
            comments: $("td.numposts", this).text().trim(),
          };
          self.threads[id] = thread;

          if (moment.duration(thread.last_updated.diff(moment())).asHours() < -48) { return; }

          if (self.threads[id] == null || self.threads[id].updated < thread.updated) {
            for (var i = 1; i <= Math.ceil(thread.comments/20); i++) {
              self._getThreadPage(id, i)
                .then((posts) => {
                  self.threads[id].posts = posts
                  console.log(util.inspect(posts))
                });
            }
          }
        });
      })
      .catch(error => logger.log("error", `Could not get marmet threads: ${error}`));
  }

  async _getThreadPosts(id, page = 1) {
    console.log(`GETTING PAGE ${page}`);
    const self = this;
    const posts = [];
    return this._getPage(`/forum/city/marmet-wv/T${id}/p${page}`)
      .then((html) => {
        const $ = cheerio.load(html);

        $(".post_table tr").each(function() {
          if ($(".str-comment-box", this).length < 1) { return; }
          posts.push({
            author: $(".authorsn, .regsn a", this).text().trim(),
            timestamp: self._parseUpdateDate($(".x-post-time", this).text().trim()),
            content: cheerio.load(toMarkdown($(".x-post-content", this).html())).text().trim(),
          });
        });

        return posts;
      });
  }

  _parseUpdateDate(date) {
    const minutes = /([0-9]+) min$/;
    if (date.match(minutes)) {
      const matches = minutes.exec(date);
      return moment().subtract(matches[1], "minutes").startOf("minute");
    }

    const hours = /([0-9]+) hrs?/;
    if (date.match(hours)) {
      const matches = hours.exec(date);
      return moment().subtract(matches[1], "hours").startOf("hour");
    }

    if (date.toLowerCase().indexOf("Yesterday") > -1) {
      return moment().startOf("day").subtract(1, "hour").startOf("day");
    }

    const days = /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/;
    if (date.match(days)) {
      return moment().isoWeekday(moment.weekdaysShort().indexOf(date)).startOf("day");
    }

    const pattern = /([A-z]+) '?([0-9]+)/;
    const matches = pattern.exec(date);

    if (matches != null) {
      if (date.indexOf("'") <= -1) {
        return moment(0).year(moment().year()).month(moment.monthsShort().indexOf(matches[1])).date(matches[2]);
      } else {
        return moment(0).year(20 + matches[2]).month(moment.monthsShort().indexOf(matches[1]));
      }
    }

    return moment(0);
  }

  _getPage(path) {

    const options = {
      host: "www.topix.com",
      port: 80,
      path,
    };

    return new Promise((resolve, reject) => {
      http.get(options, (res) => {
        let html = "";

        res.on("data", (chunk) => {
          html += chunk;
        });

        res.on("error", (error) => {
          reject(error);
        });

        res.on("end", () => {
          resolve(html);
        });
      });
    });
  }
}

export default Marmet;
