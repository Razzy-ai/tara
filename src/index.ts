import express from "express";
import cors from "cors";
import askRoute from "./routes/ask.js";
import { logger } from "./middleware/logger.js";



const app = express();

app.use(cors());
app.use(express.json());

app.use(logger);

app.use("/api", askRoute);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on ${PORT}`
  );
});