-- MySQL dump 10.13  Distrib 8.0.25, for macos10.15 (x86_64)
--
-- Host: localhost    Database: season_21_22
-- ------------------------------------------------------
-- Server version	8.0.25

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `FIXTURE`
--

DROP TABLE IF EXISTS `FIXTURE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FIXTURE` (
  `fixture_id` int NOT NULL,
  `date_fixture` datetime NOT NULL,
  `round` varchar(50) NOT NULL,
  `home_team` int NOT NULL,
  `away_team` int NOT NULL,
  `league_id` int NOT NULL,
  `status` varchar(50) NOT NULL,
  `timezone` varchar(50) NOT NULL,
  PRIMARY KEY (`fixture_id`,`home_team`,`away_team`),
  KEY `new_index` (`fixture_id`,`home_team`,`away_team`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FIXTURE`
--

LOCK TABLES `FIXTURE` WRITE;
/*!40000 ALTER TABLE `FIXTURE` DISABLE KEYS */;
/*!40000 ALTER TABLE `FIXTURE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HOMEWORK`
--

DROP TABLE IF EXISTS `HOMEWORK`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HOMEWORK` (
  `fixture_id` int NOT NULL,
  `bookmaker_id` int DEFAULT NULL,
  `home_odds` float DEFAULT NULL,
  `home_bnews` json DEFAULT NULL,
  `away_odds` float DEFAULT NULL,
  `away_bnews` json DEFAULT NULL,
  `diff_market_cap` float NOT NULL,
  `favorite` int DEFAULT NULL,
  `favorite_market_cap` float DEFAULT NULL,
  `underdog` int DEFAULT NULL,
  `underdog_market_cap` float DEFAULT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`fixture_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HOMEWORK`
--

LOCK TABLES `HOMEWORK` WRITE;
/*!40000 ALTER TABLE `HOMEWORK` DISABLE KEYS */;
/*!40000 ALTER TABLE `HOMEWORK` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LEAGUE`
--

DROP TABLE IF EXISTS `LEAGUE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LEAGUE` (
  `league_id` int NOT NULL,
  `league_name` varchar(100) NOT NULL,
  `country` varchar(100) DEFAULT NULL,
  `url_flag_country` varchar(300) NOT NULL,
  `clubs` int NOT NULL,
  `players` int NOT NULL,
  `total_market_value` varchar(100) DEFAULT NULL,
  `total_market_value_unit` varchar(2) NOT NULL,
  `total_market_value_currency` varchar(1) NOT NULL,
  `mean_market_value` varchar(100) DEFAULT NULL,
  `mean_market_value_unit` varchar(2) NOT NULL,
  `mean_market_value_currency` varchar(1) NOT NULL,
  `continent` varchar(100) DEFAULT NULL,
  `url_teams` varchar(300) NOT NULL,
  `url_logo` varchar(300) NOT NULL,
  PRIMARY KEY (`league_id`,`league_name`),
  KEY `new_index` (`league_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LEAGUE`
--

LOCK TABLES `LEAGUE` WRITE;
/*!40000 ALTER TABLE `LEAGUE` DISABLE KEYS */;
/*!40000 ALTER TABLE `LEAGUE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `OPPORTUNITY`
--

DROP TABLE IF EXISTS `OPPORTUNITY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `OPPORTUNITY` (
  `fixture_id` int NOT NULL,
  `strategy_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `OPPORTUNITY`
--

LOCK TABLES `OPPORTUNITY` WRITE;
/*!40000 ALTER TABLE `OPPORTUNITY` DISABLE KEYS */;
/*!40000 ALTER TABLE `OPPORTUNITY` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PLAYER`
--

DROP TABLE IF EXISTS `PLAYER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PLAYER` (
  `team_id` int NOT NULL,
  `position` enum('G','D','M','F','NC.') DEFAULT NULL,
  `number` varchar(2) DEFAULT NULL,
  `name` varchar(300) NOT NULL,
  `full_name` varchar(250) DEFAULT NULL,
  `birth_date` date NOT NULL,
  `market_value` float NOT NULL,
  `market_value_unit` varchar(2) NOT NULL,
  `market_value_currency` varchar(1) NOT NULL,
  `last_update` datetime NOT NULL,
  PRIMARY KEY (`team_id`,`name`,`birth_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PLAYER`
--

LOCK TABLES `PLAYER` WRITE;
/*!40000 ALTER TABLE `PLAYER` DISABLE KEYS */;
/*!40000 ALTER TABLE `PLAYER` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RELIABILITY`
--

DROP TABLE IF EXISTS `RELIABILITY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RELIABILITY` (
  `league_id` int NOT NULL,
  `reduction` int NOT NULL,
  PRIMARY KEY (`league_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RELIABILITY`
--

LOCK TABLES `RELIABILITY` WRITE;
/*!40000 ALTER TABLE `RELIABILITY` DISABLE KEYS */;
INSERT INTO `RELIABILITY` VALUES (39,1),(40,3),(61,3),(71,3),(78,1),(88,4),(94,3),(128,4),(135,2),(140,2),(144,4),(203,4);
/*!40000 ALTER TABLE `RELIABILITY` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `STRATEGY`
--

DROP TABLE IF EXISTS `STRATEGY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `STRATEGY` (
  `strategy_id` int NOT NULL AUTO_INCREMENT,
  `level` int NOT NULL,
  `trade` enum('LAY','BACK','NIL') DEFAULT 'LAY',
  `underdog_type` varchar(10) DEFAULT NULL,
  `underdog_playing` varchar(4) NOT NULL,
  `underdog_odd` float NOT NULL,
  `marketcap_diff` float NOT NULL,
  PRIMARY KEY (`strategy_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `STRATEGY`
--

LOCK TABLES `STRATEGY` WRITE;
/*!40000 ALTER TABLE `STRATEGY` DISABLE KEYS */;
INSERT INTO `STRATEGY` VALUES (1,1,'LAY','SUP UND','HOME',2,250),(2,1,'LAY','SUP UND','AWAY',2.2,250),(3,2,'LAY','SUP UND','HOME',1.4,250),(4,2,'LAY','SUP UND','AWAY',1.6,250),(5,3,'LAY','UND','AWAY',1.9,170),(6,4,'LAY','UND','HOME',1.5,170),(7,5,'LAY','UND','AWAY',1.5,170),(8,3,'LAY','WRONG FAV','NIL',1,0),(9,0,'NIL','NIL','NIL',0,0);
/*!40000 ALTER TABLE `STRATEGY` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TEAM`
--

DROP TABLE IF EXISTS `TEAM`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TEAM` (
  `team_id` int NOT NULL,
  `league_id` int NOT NULL,
  `country` varchar(150) NOT NULL,
  `name` varchar(100) NOT NULL,
  `short_name` varchar(100) NOT NULL,
  `total_market_value` float NOT NULL,
  `total_market_value_unit` varchar(2) NOT NULL,
  `total_market_value_currency` varchar(1) NOT NULL,
  `average_market_value_player` float NOT NULL,
  `average_market_value_player_unit` varchar(2) NOT NULL,
  `average_market_value_player_currency` varchar(1) NOT NULL,
  `url_logo` varchar(300) NOT NULL,
  `url_players` varchar(300) NOT NULL,
  PRIMARY KEY (`team_id`,`short_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TEAM`
--

LOCK TABLES `TEAM` WRITE;
/*!40000 ALTER TABLE `TEAM` DISABLE KEYS */;
/*!40000 ALTER TABLE `TEAM` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-08-13 17:14:43
