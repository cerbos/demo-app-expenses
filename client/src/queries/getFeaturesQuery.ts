import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { UIPermissions } from "../interfaces/UIPermissions";

export const getFeaturesQuery = () => {
  const { user } = useAuth();
  return useQuery(
    [user.id, "features"],
    (): Promise<UIPermissions> =>
      axios
        .get(`${import.meta.env.VITE_API_HOST}/me`, {
          headers: {
            Authorization: user.id,
          },
        })
        .then((res) => {
          return res.data.features;
        })
  );
};
