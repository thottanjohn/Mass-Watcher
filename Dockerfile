
FROM continuumio/miniconda3

WORKDIR /usr/src/app

COPY env.yml .

RUN conda env create -f env.yml

SHELL ["conda", "run", "-n", "myenv", "/bin/bash", "-c"]



FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./


RUN npm install

COPY . .

EXPOSE 3001

ENTRYPOINT  [ "conda", "run", "-n", "myenv", "npm", "start" ]

