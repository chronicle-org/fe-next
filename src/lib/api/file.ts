import { postMethod, TApiResponse } from ".";
import { fileUploadKey } from "../constants";

export type TResponseUpload = {
  url: string;
};

export const uploadFile = (file: File, type: keyof typeof fileUploadKey) => {
  const data = new FormData();
  data.append("file", file);
  return postMethod<FormData, TApiResponse<TResponseUpload>>(
    `/file?type=${type}`,
    data, {
      headers: {
        "Content-Type": "application/form-data"
      }
    }
  );
};
