## PRUVO CURRENCY CONVERSION MICROSERVICE
Currency Conversion Microservice for Pruvo Code Assignment. This microservice allows an easily conversion between country currencies. 

### Infrastructure
I've decided to use Nest.js for this project. I believe Nest.js is the most powerfull 
and well thought Node Framework for building modern web applications and microservices. 
Nest.js supports Typescript by default which together another modules of Node turns the 
final result application bullet proof. 

Backend Stack:

* Node.js
* TypeScript
* Nest.js 
* Docker
* ElasticMQ

### Docker Configuration
The microservice push messages to a Amazon SQS compatible in-memory message queue service that runs in Docker named ElasticMQ. The following configuratin should be made to have a development AWS SQS service 
running on localhost terminal as root:

1) Run the image at `docker run -p 9324:9324 -p 9325:9325 softwaremill/elasticmq-native`
2) Setup a queue for testing `aws --endpoint-url http://localhost:9324 --region dummy sqs create-queue --queue-name awssqs-queue`
3) Configure credentials `aws configure` setting `dummy` for accessKeyId, secretAccessKey and region
4) You can list available queues by executing `aws --endpoint-url http://localhost:9324 --region dummy sqs list-queues`
5) Run docker-compose to create the environment `docker-compose up`

With ElasticMQ up and running the microservice will push all the conversion objects received via 
http request to the AWS SQS queue, and will return a response very fast to the client. 

### Application Logic
The microservice has as main target to make a conversion between two currencies. However the conversion is not made in synchronous mode which would let the user wating the transaction to finish before sending a message back. 

Actually, the conversion request object is pushed to the AWS SQS queue service in no time and the application returns imediatelly to the user. The currency conversion information wanted is sent to the user email box passed with the request. This makes the microservice operate smothly and fast. 

Few seconds after and completely autonomous the application will pull the queued message from the AWS SQS, process the currency conversion object and finally email to the user. As the microservice itself will be in a Docker Container, it can be spread across mutiple instances, as much as needed to fulfill the demand. 




