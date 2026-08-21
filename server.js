import express from 'express';
import cors from 'cors'
import { spawn } from 'child_process'

const app = express()

//cors enabling
app.use(cors())

//definfing req.body
app.use(express.json())

const PORT = process.env.PORT || 3000

//root route
app.get("/", (req, res) => {
    res.send("Index route!!")
})

//health route
app.get("/api/health", (req, res) => {
    res.send("Server is healthy!!")
})

//data ingestion into server
app.post("/api/data/ingest", async (req, res) => {

    const employeesData = req.body
    if (!employeesData || employeesData.length <= 0) return res.status(400).send("No employee data found!")

    const coordinates = []
    for (let employee of employeesData) {
        if (!('lat' in employee) || !('lng' in employee)) return res.status(400).send("No lat & lng in employee details!")
        coordinates.push([employee['lng'], employee['lat']]);
    }
    let coordinatesString = coordinates.map(coordinate => `${coordinate[0]},${coordinate[1]}`).join(";")
    if (!coordinatesString) return res.status(400).send("No coordinates found!");
    try {
        const response = await fetch(`http://router.project-osrm.org/table/v1/driving/${coordinatesString}?annotations=distance,duration`)
        if (!response.ok) return res.status(400).send("something went wrong!!")
        const data = await response.json()
        const distancesMatrix = data["distances"]
        console.log(distancesMatrix)

        const pythonEngineProcess = spawn('python3', ['./solver.py'])

        const inputPayload = {
            matrix: distancesMatrix,
            capacities: [4, 4, 6],      
            female_indices: [1, 3], 
            shift_time: "22:00"
        }

        let engineOutput = ''
        let engineError = ''

        pythonEngineProcess.stdout.on('data', (chunk) => {
            engineOutput += chunk.toString();
        })

        pythonEngineProcess.stderr.on('error', (chunk) => {
            engineError += chunk.toString();
        })

        pythonEngineProcess.on('close', (code) => {
            if (code !== 0) {
                return res.send("something went wrong!!!")
            }
            try {
                const result = JSON.parse(engineOutput);
                console.log(result)
                return res.send(result)
            } catch (err) {
                console.log(err)
            }
        });

        pythonEngineProcess.stdin.write(JSON.stringify(inputPayload))
        pythonEngineProcess.stdin.end()
    }
    catch (e) {
        console.log(e);
        return res.status(400).send("something went wrong!!")
    }

})

//server is listening 
app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`)
})