import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
// import "swiper/css/pagination";

// import required modules
import { Pagination } from "swiper";

import styles from "./Location.module.css";

const API_KEY = "502c6236cb77f41edd4be739de30ed18";

function Location() {
  const [location, setLocation] = useState("");

  const [weatherData, setWeatherData] = useState({});
  const [input, setInput] = useState("");
  const [weeklyWeather, setWeeklyWeather] = useState({});
  const [hourlyWeather, setHourlyWeather] = useState({});
  const [clothes, setClothes] = useState({});
  const [weatherIcon, setWeatherIcon] = useState("");
  const [windDeg, setWindDeg] = useState("");
  const [rain, setRain] = useState(0);

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

          //   if (day === new Date().getDate()) {
          //     if (time + 9 < 25) {
          //       hourly.push(res.data.list[i]);
          //       setHourlyWeather(hourly);
          //     } else {
          //       weekly.push(res.data.list[i]);
          //       setWeeklyWeather(weekly);
          //     }
          //   }
          //   //오늘날짜도 어제 날짜도 아니면 weeklyWeather 변경
          //   else if (day !== new Date().getDate() - 1) {
          //     weekly.push(res.data.list[i]);
          //     setWeeklyWeather(weekly);
          //   }
          hourly.push(res.data.list[i]);
          setHourlyWeather(hourly);

          if (day !== new Date().getDate() - 1) {
            weekly.push(res.data.list[i]);
            setWeeklyWeather(weekly);
          }
          if (day === new Date().getDate()) {
            if (time + 9 > 24) {
              weekly.push(res.data.list[i]);
              setWeeklyWeather(weekly);
            }
          }
        }
      });
  }, [location]);
  console.log(hourlyWeather);

  const hourly = () => {
    const result = [];

    for (let i = 0; i < hourlyWeather.length; i++) {
      const iconCode = hourlyWeather[i].weather[0].icon;
      result.push(
        <SwiperSlide key={hourlyWeather[i].dt_txt}>
          {/* 원래 이렇게 하려고 했으나 날짜 넘어가는 부분에서 시차 9시간때문에 6시 위에 날짜가 표시됨. */}
          {/* {(hourlyWeather[i + 1] &&
            new Date(hourlyWeather[i + 1].dt_txt).getDate() !==
              new Date(hourlyWeather[i].dt_txt).getDate()) && (
            <p>{new Date(hourlyWeather[i].dt_txt).getDate()}일</p>
          )} */}
          {/* 젤 첨에는 오늘 표시하고 날짜바뀌고 3시에만 날짜 표시함 */}
          <div className={styles.dateBox}>
            {i === 0 ? (
              <p>오늘</p>
            ) : (
              new Date(hourlyWeather[i].dt_txt).getHours() + 9 > 24 &&
              new Date(hourlyWeather[i].dt_txt).getHours() - 15 === 3 && (
                <p>{new Date(hourlyWeather[i].dt_txt).getDate()}일</p>
              )
            )}
          </div>
          <p key={hourlyWeather[i].dt_txt + "hour"}>
            {new Date(hourlyWeather[i].dt_txt).getHours() + 9 < 25
              ? new Date(hourlyWeather[i].dt_txt).getHours() + 9
              : new Date(hourlyWeather[i].dt_txt).getHours() - 15}
            시
          </p>
          <p key={hourlyWeather[i].dt_txt + "temp"}>
            {Math.round(hourlyWeather[i].main.temp)}
            <span className={styles.unit}>°C</span>
          </p>
          {/* <p key={hourlyWeather[i].dt_txt + "description"}>
            {hourlyWeather[i].weather[0].description}
          </p> */}
          <img
            className={styles.hourlyIcon}
            src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`}
            alt={hourlyWeather[i].weather[0].description}
          />
          <div className={styles.popBox}>
            {/* <img className={styles.water} src="images/water.png" alt="water" /> */}
            <img
              className={styles.water}
              src="http://localhost:3000/weather/images/water.png"
              alt="water"
            />
            <div className={styles.rain}>
              {hourlyWeather[i].pop}
              <span className={styles.unit}>%</span>
            </div>
          </div>
        </SwiperSlide>
      );
    }
    return result;
  };

  const weekly = () => {
    const result = [];
    const arr = [[], [], [], [], []];
    for (let z = 0; z < 5; z++) {
      for (let y = 0; y < 8; y++) {
        if (weeklyWeather[y + z * 8]) {
          arr[z].push(weeklyWeather[y + z * 8].main.temp);
        }
      }
      if (weeklyWeather[z * 8]) {
        let date = new Date(weeklyWeather[z * 8].dt_txt);
        date = new Date(date.setDate(date.getDate() + 1));

        result.push(
          <div
            className={styles.weeklyTempItem}
            key={weeklyWeather[z * 8].dt_txt}
          >
            <p key={"maxTemp" + z}>{date.getDate()}일</p>
            <p>
              {Math.round(Math.min(...arr[z])) +
                "/" +
                Math.round(Math.max(...arr[z]))}
              <span className={styles.unit}>°C</span>
            </p>
          </div>
        );
      }
    }
    // for (let i = 0; i < weeklyWeather.length; i++) {
    //   arr.push(weeklyWeather[i].main.temp);
    //   result.push(
    //     <div key={weeklyWeather[i].dt_txt}>
    //       <p key={weeklyWeather[i].dt_txt + "hour"}>
    //         {new Date(weeklyWeather[i].dt_txt).getHours() + 9 < 25
    //           ? new Date(weeklyWeather[i].dt_txt).getHours() + 9
    //           : new Date(weeklyWeather[i].dt_txt).getHours() - 15}
    //         시
    //       </p>
    //       {/* 주간날씨 날짜별 최고 최저로 수정해야 함 */}
    //       <p key={weeklyWeather[i].dt_txt + "temp"}>
    //         {Math.round(weeklyWeather[i].main.temp)}°C
    //       </p>
    //       <p key={weeklyWeather[i].dt_txt + "description"}>
    //         {weeklyWeather[i].weather[0].description}
    //       </p>
    //     </div>
    //   );
    // }
    return result;
  };
  useEffect(() => {
    // >>weatherData 바뀌면 실행
    // 기온별 옷차림 추천 분기문
    if (weatherData.main) {
      if (Math.round(weatherData.main.temp) > 27) {
        setClothes("민소매, 반팔, 반바지, 짧은 치마, 린넨 옷");
      } else if (Math.round(weatherData.main.temp) > 22) {
        setClothes("반팔, 얇은 셔츠, 반바지, 면바지");
      } else if (Math.round(weatherData.main.temp) > 19) {
        setClothes("블라우스, 긴팔 티, 면바지, 슬랙스, 얇은 가디건, 청바지");
      } else if (Math.round(weatherData.main.temp) > 16) {
        setClothes("얇은 가디건, 니트, 맨투맨, 후드, 긴 바지");
      } else if (Math.round(weatherData.main.temp) > 11) {
        setClothes("자켓, 가디건, 청자켓, 니트, 스타킹, 청바지, 면바지");
      } else if (Math.round(weatherData.main.temp) > 8) {
        setClothes(
          "트렌치 코트, 야상점퍼, 자켓, 니트, 스타킹, 청바지, 기모바지"
        );
      } else if (Math.round(weatherData.main.temp) > 4) {
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
    {
      /* 비가 안오면 weatherData.rain이 없어서 오류남. 삼항연산자로 해결 */
    }
    weatherData.rain
      ? setRain(weatherData.rain["1h"])
      : weatherData.snow
      ? setRain(weatherData.snow["1h"])
      : setRain(0);
  }, [weatherData]);
  // 검색하면 실행
  const fetchWeatherData = async (location) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&lang=kr&units=metric`;
    const response = await axios.get(url);
    setWeatherData(response.data);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherData(location);
    setInput("");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.appName}>오늘의 날씨</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter location"
              value={input}
              onChange={(e) => {
                setLocation(e.target.value);
                setInput(e.target.value);
              }}
            />
            <button type="submit"></button>
          </form>
        </header>
        {weatherData.main && (
          <section className={`${styles.currentBox} ${styles.center}`}>
            <div className={styles.city}>
              <h2>{weatherData.name.toUpperCase()}</h2>
              {/*도시*/}
            </div>
            <div className={`${styles.currentInfo} ${styles.box}`}>
              {/*아이콘*/}
              <div
                className={styles.tempBox}
                style={{ background: `url('${weatherIcon}') no-repeat center` }}
              >
                <p className={styles.currentTemp}>
                  {Math.round(weatherData.main.temp)}
                </p>
                <span className={styles.currentTempUnit}>°C</span>
              </div>
              {/*현재기온*/}
              <div className={styles.gridBox}>
                <p>
                  최저: {Math.round(weatherData.main.temp_min)}
                  <span className={styles.unit}>°C</span>
                </p>
                <p>
                  최고: {Math.round(weatherData.main.temp_max)}
                  <span className={styles.unit}>°C</span>
                </p>
                <p>
                  체감: {Math.round(weatherData.main.feels_like)}
                  <span className={styles.unit}>°C</span>
                </p>
                <p>
                  바람: {windDeg} {weatherData.wind.speed}
                  <span className={styles.unit}>m/s</span>
                </p>
                <p>
                  습도: {weatherData.main.humidity}
                  <span className={styles.unit}>%</span>
                </p>
                <p>
                  강수량: {rain}
                  <span className={styles.unit}>mm/h</span>
                </p>
              </div>
            </div>
          </section>
        )}
        {clothes[0] && (
          <section className={`${styles.recommendedBox} ${styles.center}`}>
            <div className={styles.cate}>
              <p>추천 옷차림</p>
            </div>
            <div className={`${styles.box} ${styles.clothesBox}`}>
              <p>{clothes}</p>
            </div>
          </section>
        )}
        <section className={`${styles.hourlyBox} ${styles.center}`}>
          <div className={styles.cate}>
            <p>시간별기온</p>
          </div>
          <div className={`${styles.box} ${styles.hourlyTemp}`}>
            <div
              //  className={styles.flexBox}
              className={styles.aa}
            >
              <Swiper
                slidesPerView={4}
                // spaceBetween={30}
                pagination={{
                  clickable: true,
                }}
                className="mySwiper"
              >
                {hourly()}
              </Swiper>
            </div>
          </div>
        </section>
        <section className={`${styles.weeklyBox} ${styles.center}`}>
          <div className={styles.cate}>
            <p>주간날씨</p>
          </div>
          <div className={`${styles.box} ${styles.weeklyTemp}`}>
            <div className={styles.flexBox}>{weekly()}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Location;
