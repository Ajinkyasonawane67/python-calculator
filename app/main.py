from fastapi import FastAPI, HTTPException
from app.calculator import add, subtract, multiply, divide
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

class AdditionRequest(BaseModel):
    a: float
    b: float

@app.get("/")
def home():
    return FileResponse("frontend/index.html")

@app.get("/add")
def add_numbers(a: float, b: float):
    result = add(a, b)
    return{"result": result}

@app.get("/subtract")
def subtract_numbers(a: float, b: float):
    result = subtract(a, b)
    return {"result": result}

@app.get("/multiply")
def multiply_numbers(a: float, b:float):
    result = multiply(a,b)
    return {"result": result}

@app.get("/divide")
def divide_numbers(a: float, b:float):
    try:
        result = divide(a,b)
        return {"result": result}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@app.post("/add-json")
def add_numbers_json(request: AdditionRequest):
    result = add(request.a, request.b)
    return {"result": result}

@app.post("/subtract-json")
def subtract_numbers_json(request: AdditionRequest):
    result = subtract(request.a, request.b)
    return {"result": result}

@app.post("/multiply-json")
def multiply_numbers_json(request: AdditionRequest):
    result = multiply(request.a, request.b)
    return {"result": result}

@app.post("/divide-json")
def divide_numbers_json(request: AdditionRequest):
    try:
         result = divide(request.a, request.b)
         return {"result": result}
    except ValueError as e:
         raise HTTPException(status_code=400, detail=str(e))


app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
             
    