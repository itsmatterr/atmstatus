# atmstatus
> All data belongs to Azienda Trasporti Milanesi S.p.A. This is just a free time project.

A simple Node.js service that offers Milan Metro status in JSON.

## Built with
* Node.js 14.x

## Response format
- **Successful requests** return `data` in the following format:
  ```javascript
  {
    data: {
      lines: [
        { line: 'M1', direction: 'Rho Fieramilano', status: 'Green' },
        ...
      ]
    }
  }
  ```
  *Note*: the field `status` can have three different values (Green, Yellow, Red) based on the line status.
  
- **Failed requests** return `error` in the following format:
  ```javascript
  { error: 'Failed to connect' }
  ```

## Install
Clone the repo and install the dependencies.
```
git clone https://github.com/itsmatterr/atmstatus.git
```
```
npm install
```
## Run the service
To start the express server, run the following
```
npm run start
```
Or enter in development mode (nodemon)
```
npm run dev
```
