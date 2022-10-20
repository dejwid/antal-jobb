import Stat from "../../models/Stat";
import {initMongoose} from "../../libs/mongoose";
import {sortBy, uniqBy} from "lodash";

export async function getData() {
  const rows = JSON.parse(JSON.stringify(await Stat.find().exec()));
  return sortBy(uniqBy(rows.map(row => {
    return {...row,date:row.createdAt.substring(0,10)};
  }), row => row.source+row.phrase+row.date), 'date');
}

export default async function handle(req, res) {
  await initMongoose();
  const result = await getData();
  res.json(result);
}