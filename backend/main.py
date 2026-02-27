from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, checkin, biometrics, generate, history

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="YachaFlex API",
    description="Stress detection & adaptive educational content platform",
    version="1.0.0",
)

# CORS – allow Vercel frontend + localhost dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(checkin.router)
app.include_router(biometrics.router)
app.include_router(generate.router)
app.include_router(history.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "YachaFlex API running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
