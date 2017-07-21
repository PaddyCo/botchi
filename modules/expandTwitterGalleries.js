export default (msg) => {
  if (msg.content == "ping") {
    msg.channel.send("Pong!")
  }
}

