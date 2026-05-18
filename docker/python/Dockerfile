FROM python:3.12-slim

# Install system dependencies needed by scientific Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ gfortran \
    libopenblas-dev liblapack-dev \
    libhdf5-dev \
    libffi-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# ── Core Data Science ──────────────────────────────────────────
RUN pip install --no-cache-dir \
    numpy \
    pandas \
    scipy \
    matplotlib \
    seaborn \
    plotly

# ── Machine Learning ──────────────────────────────────────────
RUN pip install --no-cache-dir \
    scikit-learn \
    xgboost \
    lightgbm \
    statsmodels

# ── Deep Learning (CPU-only) ─────────────────────────────────
RUN pip install --no-cache-dir tensorflow-cpu
RUN pip install --no-cache-dir \
    torch torchvision torchaudio \
    --index-url https://download.pytorch.org/whl/cpu

# ── NLP ───────────────────────────────────────────────────────
RUN pip install --no-cache-dir nltk

# ── Image Processing ─────────────────────────────────────────
RUN pip install --no-cache-dir \
    Pillow \
    opencv-python-headless

# ── Web / Utilities ──────────────────────────────────────────
RUN pip install --no-cache-dir \
    requests \
    beautifulsoup4 \
    flask \
    sympy \
    cryptography

# ── Other Popular Libraries ──────────────────────────────────
RUN pip install --no-cache-dir \
    networkx \
    tabulate \
    tqdm \
    pyyaml \
    regex

# ── Plot rendering hook ─────────────────────────────────────
# Forces Agg backend and monkey-patches plt.show() to output base64 PNG
ENV MPLBACKEND=Agg
COPY sitecustomize.py /usr/local/lib/python3.12/site-packages/sitecustomize.py

# Create non-root user
RUN groupadd -r runner && useradd -r -g runner -d /sandbox -s /bin/sh runner

# Set up sandbox directory
RUN mkdir -p /sandbox && chown runner:runner /sandbox

WORKDIR /sandbox
USER runner
