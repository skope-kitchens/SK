import axios from "axios";

export const fetchFoodCost = async (dishName,wastagePercent = 5) => {
  const res = await axios.get(
    `http://localhost:5002/api/food-cost/${encodeURIComponent(dishName)}`,
    {
      params: { wastagePercent }
    }
  );
  return res.data;
};
