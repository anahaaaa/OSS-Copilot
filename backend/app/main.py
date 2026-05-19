from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def Home():
    return {
        "message" : "OSS Copilot Backend Running "
    }