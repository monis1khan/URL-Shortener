const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'url-shortener',
  // This uses the environment variable from Docker, or localhost if running locally
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'url-shortener-group' });

module.exports = { kafka, producer, consumer };