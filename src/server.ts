import express from "express";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
  });
});

app.listen(port, () => {
  console.log(`Server rodando em localhost porta ${port}`);
});
