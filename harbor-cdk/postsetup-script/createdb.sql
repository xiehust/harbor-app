  CREATE TABLE glue_databases
 ( id INT NOT NULL AUTO_INCREMENT, 
description VARCHAR(500),
s3_location VARCHAR(300),
db_name VARCHAR(100) NOT NULL,
groupname VARCHAR(50) NOT NULL,
groupid INT NOT NULL,
awsid VARCHAR(50) NOT NULL,
created DATETIME,
tables INT,
category1_id VARCHAR(20),
category2_id VARCHAR(20),
status VARCHAR(20),
PRIMARY KEY ( id ),
UNIQUE (db_name)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

 CREATE TABLE approvals_reg
 ( id INT NOT NULL AUTO_INCREMENT, 
 type VARCHAR(20) NOT NULL,
 db_name VARCHAR(100) NOT NULL,
 table_name VARCHAR(100),
s3_location VARCHAR(300),
groupname VARCHAR(50) NOT NULL,
description VARCHAR(500),
groupid INT NOT NULL,
permissions VARCHAR(1024),
created DATETIME NOT NULL,
category1_id VARCHAR(20),
category2_id VARCHAR(20),
completed DATETIME,
expiredate DATETIME,
status VARCHAR(20) NOT NULL,
PRIMARY KEY ( id )
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

  CREATE TABLE glue_databases
 ( id INT NOT NULL AUTO_INCREMENT, 
description VARCHAR(500),
s3_location VARCHAR(300),
db_name VARCHAR(100) NOT NULL,
groupname VARCHAR(50) NOT NULL,
groupid INT NOT NULL,
awsid VARCHAR(50) NOT NULL,
created DATETIME,
tables INT,
category1_id VARCHAR(20),
category2_id VARCHAR(20),
status VARCHAR(20),
PRIMARY KEY ( id ),
UNIQUE (db_name)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

  CREATE TABLE glue_tables
 ( id INT UNSIGNED NOT NULL AUTO_INCREMENT, 
table_name VARCHAR(100) NOT NULL,
db_name VARCHAR(100) NOT NULL,
description VARCHAR(500),
s3_location VARCHAR(300),
created DATETIME NOT NULL,
lastupdated DATETIME,
lftags  VARCHAR(300),
groupname VARCHAR(50) NOT NULL,
groupid INT NOT NULL,
awsid VARCHAR(50) NOT NULL,
category1_id VARCHAR(20),
category2_id VARCHAR(20),
status VARCHAR(20),
PRIMARY KEY ( id ),
UNIQUE (table_name,db_name)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE user_info 
 ( id INT NOT NULL AUTO_INCREMENT, 
 username VARCHAR(100) NOT NULL,
 password VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL,
groupid INT,
groupids VARCHAR(100),
lastupdated DATETIME NOT NULL,
status VARCHAR(20) NOT NULL,
secret VARCHAR(100),
PRIMARY KEY ( id ),
UNIQUE (username,groupid)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE group_info 
 ( id INT NOT NULL AUTO_INCREMENT, 
groupname VARCHAR(100) NOT NULL,
grouptype VARCHAR(50) NOT NULL,
awsid VARCHAR(50) NOT NULL,
lastupdated DATETIME NOT NULL,
status VARCHAR(20) NOT NULL,
PRIMARY KEY ( id ),
UNIQUE (groupname,grouptype)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;




 CREATE OR REPLACE VIEW sharinglinks_view as 
 SELECT 
 a.id,
 a.db_name,
 b.id as table_id,
a.table_name,
a.s3_location,
a.groupname as consumer,
a.groupid as consumerid,
c.awsid as consumerawsid,
a.expiredate,
a.completed,
a.created,
a.status,
b.groupname as producer,
b.groupid as producerid,
b.awsid as producerawsid,
a.category1_id,
a.category2_id

 FROM approvals_reg a
 join group_info c
 on a.groupid = c.id
 and a.type = 'subscribe'
 left join glue_tables b
 on a.db_name = b.db_name
 and a.table_name = b.table_name;


  CREATE OR REPLACE VIEW overviewstats_view as 
SELECT
count(distinct a.db_name) as total_databases,
sum(a.tables) as total_tables,
count(distinct a.s3_location) as total_locations,
b.total_sharinglinks,
b.total_consumers,
b.total_producers
FROM glue_databases a,
(select 
count(id) as total_sharinglinks,
count(distinct consumer) as total_consumers,
count(distinct producer) as total_producers
from sharinglinks_view
where status = 'approved') b;