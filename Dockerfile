FROM node:lts-alpine3.9
WORKDIR /mnt

ADD script.js ./
ADD package.json ./

RUN npm i

CMD zip -r ${LOCATION} "$(date +%F).zip"  && node script
