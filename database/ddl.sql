/*
CREATE TABLE `commutes` (
  `commute_id` int(11) NOT NULL AUTO_INCREMENT,
  `commute_date` date NOT NULL,
  `ssm` int(11) NOT NULL,
  `iso_time` datetime NOT NULL,
  `to_work` int(11) NOT NULL,
  `to_home` int(11) NOT NULL,
  `to_work_no_traffic` int(11) NOT NULL,
  `to_home_no_traffic` int(11) NOT NULL,
  `eight_later` int(11) NOT NULL,
  `warnings_wth` varchar(50) DEFAULT NULL,
  `warnings_htw` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`commute_id`),
  KEY `commute_date` (`commute_date`),
  CONSTRAINT `commutes_ibfk_1` FOREIGN KEY (`commute_date`) REFERENCES `days` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `days` (
  `date` date NOT NULL,
  `day_of` varchar(20) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `day` int(11) NOT NULL,
  PRIMARY KEY (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `weathers` (
  `weather_id` int(11) NOT NULL AUTO_INCREMENT,
  `weather_date` date NOT NULL,
  `ssm` int(11) NOT NULL,
  `temp` float NOT NULL,
  `temp_f` float NOT NULL,
  `humidity` int(11) NOT NULL,
  `weather` varchar(50) NOT NULL,
  `visibility` int(11) NOT NULL,
  `sunrise` int(11) NOT NULL,
  `sunset` int(11) NOT NULL,
  `wind` float NOT NULL,
  `wind_dir` varchar(10) NOT NULL,
  PRIMARY KEY (`weather_id`),
  KEY `weather_date` (`weather_date`),
  CONSTRAINT `weathers_ibfk_1` FOREIGN KEY (`weather_date`) REFERENCES `days` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
*/