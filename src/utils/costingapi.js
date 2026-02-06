import api from "./api";

export const fetchFoodCost = async (recipeName, wastagePercent) => {
  const res = await api.post("/api/costing/calculate", {
    recipeName,
    wastagePercent,
  });
  return res.data;
};
