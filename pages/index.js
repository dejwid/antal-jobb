import {Line, LineChart, CartesianGrid, ResponsiveContainer, Legend, Tooltip, XAxis, YAxis} from "recharts";
import {useEffect, useState} from "react";
import {getData} from "./api/data";
import {groupBy} from "lodash";
import {initMongoose} from "../libs/mongoose";

export default function Home({data:rows}) {
  const [domLoaded,setDomLoaded] = useState(false);
  useEffect(() => {
    setDomLoaded(true);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{backgroundColor:'rgba(0,0,0,.8)',padding:'5px',border:0}}>
          <h3>{label}</h3>
          {payload.map(item => (
            <p key={item.name} style={{color:item.color}}>{item.name}: {item.value}</p>
          ))}
          <p className="label">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }

    return null;
  };

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
  const colors = ['#ff0094', '#E0144C', '#FF5858', '#AA8B56', '#395144', '#425F57', '#749F82'];
  return (
    <div>
      <div className="w-full" style={{height:'90vh'}}>
        {domLoaded && (
          <ResponsiveContainer width="99%">
            <LineChart data={data}
                       margin={{ top: 10, right: 10, left: 0, bottom: 45 }}>
              <XAxis dataKey="date" style={{fill:'#111',fontSize:'.7rem'}} />
              <YAxis label={{fill:'red'}} style={{fill:'#111',fontSize:'.7rem'}}  />
              <CartesianGrid strokeDasharray="1 1" stroke={'#333'} style={{borderStyle:{color:'red'}}}  />
              <Legend layout='vertical' align="center" verticalAlign='bottom' />
              <Tooltip content={<CustomTooltip />} />
              {keys.map(key => (
                <Line type="monotone"
                      key={key}
                      dataKey={key}
                      strokeWidth={5}
                      stroke={colors[keys.indexOf(key)]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  await initMongoose();
  const data = await getData();
  return {props:{data:JSON.parse(JSON.stringify(data))}};
}
