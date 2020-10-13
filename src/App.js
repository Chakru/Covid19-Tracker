import React, { useState, useEffect } from 'react';
import './App.css';
import {
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@material-ui/core';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { sortData, prettyPrintStats } from './utils';
import LineGraph from './LineGraph';
import 'leaflet/dist/leaflet.css';

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState(['worldwide']);
  const [countryInfo, setCountryInfo] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({
    lat: 21.1289956,
    lng: 82.7792201,
  });
  const [mapZoom, setMapZoom] = useState([3]);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState(['cases']);

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    //Async-> Sends a request, wait for it, do something with it
    // Async important concept
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then(response => response.json())
        .then(data => {
          const countries = data.map(country => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async event => {
    const countryCode = event.target.value;

    const url =
      countryCode === 'worldwide'
        ? 'https://disease.sh/v3/covid-19/all'
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onClick={onCountryChange}
              value={country}
            >
              <MenuItem value="worldwide">WorldWide</MenuItem>
              {countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            isRed
            onClick={e => setCasesType('cases')}
            active={casesType === 'cases'}
            title="CoronaVirus Cases"
            cases={prettyPrintStats(countryInfo.todayCases)}
            total={prettyPrintStats(countryInfo.cases)}
          />
          <InfoBox
            onClick={e => setCasesType('recovered')}
            active={casesType === 'recovered'}
            title="CoronaVirus Recovered"
            cases={prettyPrintStats(countryInfo.todayRecovered)}
            total={prettyPrintStats(countryInfo.recovered)}
          />
          <InfoBox
            isRed
            onClick={e => setCasesType('deaths')}
            active={casesType === 'deaths'}
            title="CoronaVirus Deaths"
            cases={prettyPrintStats(countryInfo.todayDeaths)}
            total={prettyPrintStats(countryInfo.deaths)}
          />
        </div>
        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">World Wide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
