package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/event"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

// change here the config as per Docker deployment, make sure to finish this by Monday Afternoon

func InitDatabase() {
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://mongo:27017"
	}

	cmdMonitor := &event.CommandMonitor{
		Started: func(_ context.Context, evt *event.CommandStartedEvent) {
			log.Printf("MongoDB Query: %s | Database: %s | Command: %s",
				evt.CommandName, evt.DatabaseName, evt.Command)
		},
		Succeeded: func(_ context.Context, evt *event.CommandSucceededEvent) {
			log.Printf("MongoDB Query Succeeded: %s | Duration: %dms",
				evt.CommandName, evt.Duration/1000000)
		},
		Failed: func(_ context.Context, evt *event.CommandFailedEvent) {
			log.Printf("MongoDB Query Failed: %s | Error: %s",
				evt.CommandName, evt.Failure)
		},
	}

	clientOpts := options.Client().
		ApplyURI(mongoURI).
		SetMonitor(cmdMonitor)

	client, err := mongo.Connect(context.TODO(), clientOpts)
	if err != nil {
		log.Fatal("Failed to connect", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("Failed to ping", err)
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "attendance_db"
	}

	DB = client.Database(dbName)

	err = DB.CreateCollection(context.TODO(), "users")
	if err != nil {
		log.Printf("Already exists: %v", err)
	}

	log.Printf("[[[  Connected to MongoDB - Database  ]]]: %s", dbName)
}
