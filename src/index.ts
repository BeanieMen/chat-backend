import { WebSocketServer } from "ws";
import { HighDB } from "./db";

const db = new HighDB<{
  messages: { sender: string; message: string; createdAt: Date }[];
}>("messages.json", { messages: [] });
const wss = new WebSocketServer({ port: 8000 });

wss.on("connection", function connection(socket, req) {
  socket.on("error", console.error);

  const url = new URL(req.url ?? "", `http://${req.headers.host}`);
  const email: string = url.searchParams.get("email")!;

  socket.on("message", (data: Buffer) => {
    const message = JSON.parse(data.toString());
    switch (message.type) {
      case "getMessages":
        socket.send(JSON.stringify({ data: db.data, type: "messageList" }));
        break;
      case "postMessage":
        handlePostMessage(email, message.data);
        break;
      default:
        console.error("Unknown message type:", message);
    }
  });
});

function handlePostMessage(email: string, message: string) {
  db.setConfig({
    messages: [
      ...db.data.messages,
      { sender: email, createdAt: new Date(), message: message },
    ],
  });
  wss.clients.forEach((client) => {
    client.send(JSON.stringify({ type: "messageList", data: db.data }));
  });
}
