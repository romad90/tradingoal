-- MySQL dump 10.13  Distrib 8.0.25, for macos10.15 (x86_64)
--
-- Host: localhost    Database: league
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
-- Table structure for table `DOMESTIC_NEXT_FIXTURE`
--

DROP TABLE IF EXISTS `DOMESTIC_NEXT_FIXTURE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DOMESTIC_NEXT_FIXTURE` (
  `match_number` int NOT NULL,
  `round_number` int NOT NULL,
  `date_fixture` date NOT NULL,
  `home_team` int NOT NULL,
  `away_team` int NOT NULL,
  `league_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DOMESTIC_NEXT_FIXTURE`
--

LOCK TABLES `DOMESTIC_NEXT_FIXTURE` WRITE;
/*!40000 ALTER TABLE `DOMESTIC_NEXT_FIXTURE` DISABLE KEYS */;
/*!40000 ALTER TABLE `DOMESTIC_NEXT_FIXTURE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LEAGUE`
--

DROP TABLE IF EXISTS `LEAGUE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LEAGUE` (
  `league_id` int NOT NULL AUTO_INCREMENT,
  `league_name` varchar(100) NOT NULL,
  `country` varchar(100) DEFAULT NULL,
  `clubs` int NOT NULL,
  `players` int NOT NULL,
  `total_market_value` varchar(100) DEFAULT NULL,
  `total_market_value_unit` varchar(2) NOT NULL,
  `mean_market_value` varchar(100) DEFAULT NULL,
  `mean_market_value_unit` varchar(2) NOT NULL,
  `continent` varchar(100) DEFAULT NULL,
  `url_teams` varchar(300) NOT NULL,
  `url_logo` varchar(300) NOT NULL,
  PRIMARY KEY (`league_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LEAGUE`
--

LOCK TABLES `LEAGUE` WRITE;
/*!40000 ALTER TABLE `LEAGUE` DISABLE KEYS */;
INSERT INTO `LEAGUE` VALUES (1,'Bundesliga',NULL,0,0,NULL,'',NULL,'',NULL,'',''),(2,'Premier League',NULL,0,0,NULL,'',NULL,'',NULL,'',''),(3,'Ligue 1',NULL,0,0,NULL,'',NULL,'',NULL,'',''),(4,'Serie A',NULL,0,0,NULL,'',NULL,'',NULL,'',''),(5,'LaLiga',NULL,0,0,NULL,'',NULL,'',NULL,'','');
/*!40000 ALTER TABLE `LEAGUE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PLAYER`
--

DROP TABLE IF EXISTS `PLAYER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PLAYER` (
  `player_id` int NOT NULL AUTO_INCREMENT,
  `position` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `full_name` varchar(300) NOT NULL,
  `date_of_birth` date NOT NULL,
  `current_international` varchar(100) NOT NULL,
  `caps` int NOT NULL,
  `value` float NOT NULL,
  `last_update` date NOT NULL,
  PRIMARY KEY (`player_id`)
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
  `reliability_id` int NOT NULL AUTO_INCREMENT,
  `league_id` int NOT NULL,
  `ratio` int NOT NULL,
  PRIMARY KEY (`reliability_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RELIABILITY`
--

LOCK TABLES `RELIABILITY` WRITE;
/*!40000 ALTER TABLE `RELIABILITY` DISABLE KEYS */;
INSERT INTO `RELIABILITY` VALUES (1,1,1),(2,2,1),(3,3,3),(4,4,3),(5,5,3);
/*!40000 ALTER TABLE `RELIABILITY` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RESUME`
--

DROP TABLE IF EXISTS `RESUME`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RESUME` (
  `round_number` int NOT NULL,
  `report` blob NOT NULL,
  `date_of_creation` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RESUME`
--

LOCK TABLES `RESUME` WRITE;
/*!40000 ALTER TABLE `RESUME` DISABLE KEYS */;
/*!40000 ALTER TABLE `RESUME` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TEAM`
--

DROP TABLE IF EXISTS `TEAM`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TEAM` (
  `team_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `total_market_value` float NOT NULL,
  `total_market_value_unit` varchar(1) NOT NULL,
  `average_market_value_player` float NOT NULL,
  `average_market_value_player_unit` varchar(1) NOT NULL,
  `url_logo` varchar(300) NOT NULL,
  `url_players` varchar(300) NOT NULL,
  PRIMARY KEY (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TEAM`
--

LOCK TABLES `TEAM` WRITE;
/*!40000 ALTER TABLE `TEAM` DISABLE KEYS */;
/*!40000 ALTER TABLE `TEAM` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TRADING_JOURNAL`
--

DROP TABLE IF EXISTS `TRADING_JOURNAL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TRADING_JOURNAL` (
  `round_number` int NOT NULL,
  `match_number` int NOT NULL,
  `date_fixture` date NOT NULL,
  `home_team` int NOT NULL,
  `home_cap` float NOT NULL,
  `away_team` int NOT NULL,
  `away_cap` float NOT NULL,
  `home_odds` float NOT NULL,
  `away_odds` float NOT NULL,
  `bnews_home_team` blob,
  `bnews_away_team` blob,
  `game_day_cap_diff` float DEFAULT NULL,
  `strategies` blob
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TRADING_JOURNAL`
--

LOCK TABLES `TRADING_JOURNAL` WRITE;
/*!40000 ALTER TABLE `TRADING_JOURNAL` DISABLE KEYS */;
/*!40000 ALTER TABLE `TRADING_JOURNAL` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-06-14 18:38:48
