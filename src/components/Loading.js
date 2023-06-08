import React from "react";
import { Background, LoadingText } from "./Styles";

export const Loading = () => {
  return (
    <Background>
      <LoadingText>잠시만 기다려 주세요.</LoadingText>
    </Background>
  );
};

export default Loading;
