export default async function handler(req: any, res: any) {
  res.status(200).json({
    temp: 28,
    city: "Medan",
    condition: "Sunny",
    icon: "sun"
  });
}
