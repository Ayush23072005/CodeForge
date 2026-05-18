FROM gcc:13-bookworm

# Install popular C++ libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    # ── Header-only libraries ──
    libeigen3-dev \
    nlohmann-json3-dev \
    # ── Boost (headers + linked) ──
    libboost-all-dev \
    # ── Linear algebra ──
    libarmadillo-dev \
    libopenblas-dev \
    liblapack-dev \
    # ── Scientific computing ──
    libgsl-dev \
    # ── Image processing ──
    libopencv-dev \
    # ── Database ──
    libsqlite3-dev \
    # ── Build tools ──
    cmake \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r runner && useradd -r -g runner -d /sandbox -s /bin/sh runner

# Set up sandbox directory
RUN mkdir -p /sandbox && chown runner:runner /sandbox

WORKDIR /sandbox
USER runner
