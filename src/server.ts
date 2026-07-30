import express from "express";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
  });
});

app.post("/recommendations", (request, response) => {
  const prompt = request.body.prompt;

  response.status(200).json({
    message: "Recommendation Recevied",
    prompt: prompt,
  });
});

app.listen(port, () => {
  console.log(`Server rodando em localhost porta ${port}`);
});
