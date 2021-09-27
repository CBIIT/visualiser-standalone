import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import { createStore } from 'redux'
import ReduxDataDictionary from './DataDictionary/ReduxDataDictionary';
import reducers from './reducers'
import axios from 'axios';
import yaml from 'js-yaml';


const version = { "commit": "913161064b02bcef024d072873e77c8c79cc1a68", "dictionary": { "commit": "520a25999fd183f6c5b7ddef2980f3e839517da5", "version": "0.2.1-9-g520a259" }, "version": "4.0.0-44-g9131610" };

const getData = async (url) => {
  const response = await axios.get(url);
  const data = yaml.safeLoad(response.data);
  return data;
}

async function init() {

  const store = createStore(reducers);
  console.log(process.env.REACT_APP_MODEL_URL);
  console.log(process.env.REACT_APP_MODEL_PROPS_URL);

  // let url = 'https://wfy1997.s3.amazonaws.com/schema.json';
  // if (window.location.hash) url = window.location.hash.slice(1);

  const icdcMData = await getData(process.env.REACT_APP_MODEL_URL);
  const icdcMPData = await getData(process.env.REACT_APP_MODEL_PROPS_URL);

  //translate the json file here
  const dataList = {};

  //using the following code the convert MDF to Gen3 format
  for (let [key, value] of Object.entries(icdcMData.Nodes)) {

    const item = {}
    item["$schema"] = "http://json-schema.org/draft-06/schema#";
    item["id"] = key;
    item["title"] = key;
    if ("Category" in value) {
      item["category"] = value.Category;
    } else {
      item["category"] = "Undefined";
    }
    item["program"] = "*";
    item["project"] = "*";
    item["additionalProperties"] = false;
    item["submittable"] = true;
    item["constraints"] = null;
    item["type"] = "object";

    const link = [];
    const properties = {};
    const pRequired = [];

    if (icdcMData.Nodes[key].Props != null) {

      for (var i = 0; i < icdcMData.Nodes[key].Props.length; i++) {

        const nodeP = icdcMData.Nodes[key].Props[i];
        const propertiesItem = {};
        for (var propertyName in icdcMPData.PropDefinitions) {

          if (propertyName === nodeP) {

            propertiesItem["description"] = icdcMPData.PropDefinitions[propertyName].Desc;
            propertiesItem["type"] = icdcMPData.PropDefinitions[propertyName].Type;
            propertiesItem["src"] = icdcMPData.PropDefinitions[propertyName].Src;

            if (icdcMPData.PropDefinitions[propertyName].Req === true) {
              pRequired.push(nodeP);
            }
          }
        }
        properties[nodeP] = propertiesItem;
      }
  
      item["properties"] = properties;
      item["required"] = pRequired;
    } else {
      item["properties"] = {};
    }

    for (var property in icdcMData.Relationships) {
      const linkItem = {};

      const label = propertyName;
      // const multiplicity = icdcMData.Relationships[propertyName].Mul;
      const required = false;
      // eslint-disable-next-line no-redeclare
      for (var i = 0; i < icdcMData.Relationships[property].Ends.length; i++) {

        if (icdcMData.Relationships[property].Ends[i].Src === key) {
          const backref = icdcMData.Relationships[property].Ends[i].Src;
          const name = icdcMData.Relationships[property].Ends[i].Dst;
          const target = icdcMData.Relationships[property].Ends[i].Dst;

          linkItem["name"] = name;
          linkItem["backref"] = backref;
          linkItem["label"] = label;
          linkItem["target_type"] = target;
          linkItem["required"] = required;

          link.push(linkItem);
        }
      }
    }
  
    item["links"] = link;
    dataList[key] = item;
  }
  
  const newDataList = dataList;
  
  await Promise.all(
    [
      store.dispatch({
        type: 'RECEIVE_DICTIONARY',
        //data: newDict
        data: newDataList
      }),
      store.dispatch({
        type: 'RECEIVE_VERSION_INFO',
        data: version
      })
    ],
  );

  ReactDOM.render(

    <React.StrictMode>
      <Provider store={store}>
        <ReduxDataDictionary url={'google.com'} />
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

init();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
serviceWorker.unregister();
