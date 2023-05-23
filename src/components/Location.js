import React, { useEffect, useState } from "react";
import axios from "axios";

const API_KEY = "502c6236cb77f41edd4be739de30ed18";

function Location() {
  const [location, setLocation] = useState("");

  const [weatherData, setWeatherData] = useState({});
  const [forecast, setForecast] = useState({});
  const [weeklyWeather, setWeeklyWeather] = useState({});
  const [hourlyWeather, setHourlyWeather] = useState({});
  const [clothes, setClothes] = useState({});
  const [weatherIcon, setWeatherIcon] = useState("");
  const [windDeg, setWindDeg] = useState("");

  // 현재 위치 좌표로 변경
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    });
  }, []);

  useEffect(() => {
    // >> location 바뀌면 실행
    if (!location.lat) {
      // 검색 전이면 리턴
      return;
    }
    // 검색한 지역의 좌표로 변경
    const lat = location.lat;
    const lon = location.lon;

    // 검색된 지역의 날씨 json 가져오기
    axios
      .get("https://api.openweathermap.org/data/2.5/weather", {
        params: {
          lat: lat,
          lon: lon,
          lang: "kr",
          units: "metric",
          appid: API_KEY,
        },
      })
      .then((res) => {
        setWeatherData(res.data);
      });
    // 검색된 지역의 주간 날씨 데이터를 가져옴
    axios
      .get("https://api.openweathermap.org/data/2.5/forecast", {
        params: {
          lat: lat,
          lon: lon,
          lang: "kr",
          units: "metric",
          appid: API_KEY,
        },
      })
      .then((res) => {
        let hourly = [];
        let weekly = [];

        for (let i = 0; i < res.data.list.length; i++) {
          let day = new Date(res.data.list[i].dt_txt).getDate();
          let time = new Date(res.data.list[i].dt_txt).getHours();

          // 오늘날짜와 일치하면 hourlyWeather 변경
          //time에 9를 더한 이유 : utc기준 시간이라 우리나라가 9시간 더 빠르다.
          if (day === new Date().getDate()) {
            if (time + 9 < 25) {
              hourly.push(res.data.list[i]);
              setHourlyWeather(hourly);
            } else {
                weekly.push(res.data.list[i]);
                setWeeklyWeather(weekly);
            }
        }
        //오늘날짜도 어제 날짜도 아니면 weeklyWeather 변경
        else if (day !== new Date().getDate() - 1) {
            weekly.push(res.data.list[i]);
            setWeeklyWeather(weekly);
        }
    }
});
}, [location]);
console.log(weeklyWeather[0].weather[0].description);
  const hourly = () => {
    const result = [];
    for (let i = 0; i < hourlyWeather.length; i++) {
      result.push(
        <div key={hourlyWeather[i].dt_txt}>
          <p key={hourlyWeather[i].dt_txt + "hour"}>
            {new Date(hourlyWeather[i].dt_txt).getHours() + 9}시
          </p>
          <p key={hourlyWeather[i].dt_txt + "temp"}>
            {Math.round(hourlyWeather[i].main.temp)}°C
          </p>
          <p key={hourlyWeather[i].dt_txt + "description"}>
            {hourlyWeather[i].weather[0].description}
          </p>
        </div>
      );
    }
    return result;
  };
  const weekly = () => {
    const result = [];
    for (let i = 0; i < weeklyWeather.length; i++) {
      result.push(
        <div key={weeklyWeather[i].dt_txt}>
          <p key={weeklyWeather[i].dt_txt + "hour"}>
            {new Date(weeklyWeather[i].dt_txt).getHours() + 9 < 25
              ? new Date(weeklyWeather[i].dt_txt).getHours() + 9
              : new Date(weeklyWeather[i].dt_txt).getHours() - 15}
            시
          </p>
          {/* 주간날씨 날짜별 최고 최저로 수정해야 함 */}
          <p key={weeklyWeather[i].dt_txt + "temp"}>
            {Math.round(weeklyWeather[i].main.temp)}°C
          </p>
          <p key={weeklyWeather[i].dt_txt + "description"}>
            {weeklyWeather[i].weather[0].description}
          </p>
        </div>
      );
    }
    return result;
  };
  useEffect(() => {
    // >>weatherData 바뀌면 실행
    // 기온별 옷차림 추천 분기문
    if (weatherData.main) {
      if (weatherData.main.temp >= 28) {
        setClothes("민소매, 반팔, 반바지, 짧은 치마, 린넨 옷");
      } else if (weatherData.main.temp <= 27 && weatherData.main.temp >= 23) {
        setClothes("반팔, 얇은 셔츠, 반바지, 면바지");
      } else if (weatherData.main.temp <= 22 && weatherData.main.temp >= 20) {
        setClothes("블라우스, 긴팔 티, 면바지, 슬랙스, 얇은 가디건, 청바지");
      } else if (weatherData.main.temp <= 19 && weatherData.main.temp >= 17) {
        setClothes("얇은 가디건, 니트, 맨투맨, 후드, 긴 바지");
      } else if (weatherData.main.temp <= 16 && weatherData.main.temp >= 12) {
        setClothes("자켓, 가디건, 청자켓, 니트, 스타킹, 청바지, 면바지");
      } else if (weatherData.main.temp <= 11 && weatherData.main.temp >= 9) {
        setClothes(
          "트렌치 코트, 야상점퍼, 자켓, 니트, 스타킹, 청바지, 기모바지"
        );
      } else if (weatherData.main.temp <= 8 && weatherData.main.temp >= 5) {
        setClothes("울코트, 히트텍, 가죽옷, 기모, 니트, 레깅스");
      } else {
        setClothes("패딩, 두꺼운 코트, 누빔 옷, 기모, 목도리");
      }
    }
    // 날씨 아이콘
    if (weatherData.weather) {
      const iconCode = weatherData.weather[0].icon;
      setWeatherIcon(`https://openweathermap.org/img/wn/${iconCode}@2x.png`);
    }
    // 풍향(다 만들고 공부할 것)
    const WindType = {
      N0: [0, "북"],
      NNE: [1, "북북동"],
      NE: [2, "북동"],
      ENE: [3, "동북동"],
      E: [4, "동"],
      ESE: [5, "동남동"],
      SE: [6, "남동"],
      SSE: [7, "남남동"],
      S: [8, "남"],
      SSW: [9, "남남서"],
      SW: [10, "남서"],
      WSW: [11, "서남서"],
      W: [12, "서"],
      WNW: [13, "서북서"],
      NW: [14, "북서"],
      NNW: [15, "북북서"],
      N16: [16, "북"],

      value: function (value) {
        for (const type in this) {
          if (this[type][0] === value) {
            return this[type];
          }
        }
        return null;
      },
    };

    function getWindDirection(degree) {
      const result = Math.floor((degree + 22.5 * 0.5) / 22.5);
      const windType = WindType.value(result);
      return windType[1];
    }
    if (weatherData.wind) {
      const wd = getWindDirection(weatherData.wind.deg);
      setWindDeg(wd);
    }
  }, [weatherData]);
  // 검색하면 실행
  const fetchWeatherData = async (location) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&lang=kr&units=metric`;
    const response = await axios.get(url);
    setWeatherData(response.data);
    console.log(weatherData);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherData(location);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter location"
          // value={weatherData.name}
          onChange={(e) => {
            setLocation(e.target.value);
          }}
        />
        <button type="submit">Get Weather</button>
      </form>
      {weatherData.main && (
        <div>
          <h2>{weatherData.name}날씨</h2>
          <p>
            {weatherData.weather[0].description}
            <img src={weatherIcon}></img>
          </p>
          <p>기온: {Math.round(weatherData.main.temp)}°C</p>
          <p>체감기온: {Math.round(weatherData.main.feels_like)}°C</p>
          <p>습도: {weatherData.main.humidity}%</p>
          <p>최저기온: {Math.round(weatherData.main.temp_min)}°C</p>
          <p>최고기온: {Math.round(weatherData.main.temp_max)}°C</p>
          <p>
            바람: {windDeg} {weatherData.wind.speed}m/s
          </p>
          {weeklyWeather[0]&&(
              <p>강수확률: {weeklyWeather[0].pop}%</p>
          )}
        </div>
      )}
      {clothes[0] && <p>기온별 옷차림: {clothes}</p>}
      <div>
        <p>시간별기온</p>
        {hourly()}
        <p>주간날씨</p>
        {weekly()}
      </div>
    </div>
  );
}

export default Location;
