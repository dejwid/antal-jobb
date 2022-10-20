import {initMongoose} from "../../libs/mongoose";
import Stat from "../../models/Stat";

const bwPhrases = ['+', 'javascript','php','python'];
const afmPhrases = ['javascript','php','python'];
const bwLink = 'https://www.brainville.com/HittaKonsultuppdrag?Text=';
const afmLink = 'https://platsbanken-api.arbetsformedlingen.se/jobs/v1/search';

const sources = {
  brainville: {
    phrases: bwPhrases,
    quantity: async phrase =>
      parseInt((new RegExp('<span>([0-9]+)<\/span>[\\s]+match')
        .exec(await fetch(bwLink+phrase).then(r => r.text())))?.[1] || 0),
  },
  'arbetsförmedlingen': {
    phrases: afmPhrases,
    quantity: async phrase => (await fetch(afmLink, {
      method:'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({"filters":[{"type":'freetext',"value":phrase}],"fromDate":null,"order":"relevance","maxRecords":25,"startIndex":0,"toDate":(new Date).toISOString(),"source":"pb"}),
    }).then(r => r.json()))?.['numberOfAds'],
  },
};

export default async function handler(req, res) {
  let result = [];
  for (let sourceName in sources) {
    const {phrases, quantity} = sources[sourceName];
    for (let phrase of phrases) {
      result.push({
        quantity: await quantity(phrase),
        source: sourceName,
        phrase,
      });
    }
  }

  await initMongoose();
  for (let row of result) {
    await Stat.create(row);
  }

  res.json('ok');
}