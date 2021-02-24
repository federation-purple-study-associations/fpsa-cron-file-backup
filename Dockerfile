FROM node:lts-alpine3.9
WORKDIR /mnt

ADD script.js ./
ADD package.json ./

RUN apk add zip
RUN npm i

CMD zip -r  "$(date +%F).zip" ${LOCATION} && node script
