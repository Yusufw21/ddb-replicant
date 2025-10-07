import { useEffect } from "react";

export function b2_counter({
  set_b1_counter1,
  set_b1_counter2,
  set_b1_counter3,
  set_b1_key1,
  set_b1_key2,
  set_b1_key3,
}) {
  useEffect(() => {
    const getRandomNumber = () => Math.floor(Math.random() * 10) + 1;

    const counter1_interval = setInterval(() => {
      const num = getRandomNumber();
      set_b1_counter1((prev) => prev + num);
      set_b1_key1((prev) => prev + 1);
    }, 1000);

    const counter2_interval = setInterval(() => {
      const num = getRandomNumber();
      set_b1_counter2((prev) => prev + num);
      set_b1_key2((prev) => prev + 1);
    }, 1000);

    const counter3_interval = setInterval(() => {
      const num = getRandomNumber();
      set_b1_counter3((prev) => prev + num);
      set_b1_key3((prev) => prev + 1);
    }, 1000);

    // Очистка интервалов при размонтировании
    return () => {
      clearInterval(counter1_interval);
      clearInterval(counter2_interval);
      clearInterval(counter3_interval);
    };
  }, []);
}
