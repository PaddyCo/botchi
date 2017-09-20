import winston from "winston";
import moment from "moment";

const logger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({
      timestamp: () => moment().format("YYYY-MM-DD HH:mm"),
      formatter: (options) => `[${options.level}][${options.timestamp()}] ${options.message}`
    })
  ]
});

export default logger;
