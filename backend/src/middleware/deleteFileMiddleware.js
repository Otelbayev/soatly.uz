import { deleteFile } from "../utils/fileRemover.js";

export const cleanFileAfterDelete = (columnName) => {
  return async (req, res, next) => {
    const deletedData = res.locals.deletedData;

    if (deletedData && deletedData[columnName]) {
      await deleteFile(deletedData[columnName]);
    }

    res.json({ success: true, message: "Ma'lumot va fayl o'chirildi" });
  };
};
