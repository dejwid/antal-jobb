import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Legend, Tooltip, XAxis, YAxis} from "recharts";
import {useEffect, useState} from "react";
import {getData} from "./api/data";
import {groupBy} from "lodash";

export default function Home({data:rows}) {
  const [domLoaded,setDomLoaded] = useState(false);
  useEffect(() => {
    setDomLoaded(true);
  }, []);

  const grouped = groupBy(rows, 'date');
  for (let date in grouped) {
    let results = {};
    for (let row of grouped[date]) {
      results[row.source + '-' + row.phrase] = row.quantity;
    }
    grouped[date] = results;
  }
  const data = Object.keys(grouped).map(date => ({date,...grouped[date]}));
  const keys = Object.keys(data[0]).filter(k => k.length>5).sort();
  const colors = ['#9A1663', '#E0144C', '#FF5858', '#AA8B56', '#395144', '#425F57', '#749F82'];
  console.log({data});
  return (
    <div>
      <div className="w-full" style={{height:'100vh'}}>
        {domLoaded && (
          <ResponsiveContainer width="99%">
            <AreaChart data={data}
                       margin={{ top: 10, right: 10, left: 0, bottom: 45 }}>
              <XAxis dataKey="date" style={{fill:'#aaa',fontSize:'.7rem'}} />
              <YAxis label={{fill:'red'}} style={{fill:'#aaa',fontSize:'.7rem'}}  />
              <CartesianGrid strokeDasharray="1 1" style={{borderStyle:{color:'red'}}}  />
              <Legend layout='vertical' align="center" verticalAlign='bottom' />
              <Tooltip />
              {keys.map(key => (
                <Area type="monotone"
                      key={key}
                      dataKey={key}
                      strokeWidth={10}
                      stroke={colors[keys.indexOf(key)]} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  const data = await getData();
  return {props:{data:JSON.parse(JSON.stringify(data))}};
}
