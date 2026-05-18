FROM eclipse-temurin:21-jdk-jammy

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create shared library directory
RUN mkdir -p /usr/share/java/lib

# ── JSON libraries ──
RUN wget -q -P /usr/share/java/lib/ \
    https://repo1.maven.org/maven2/com/google/code/gson/gson/2.11.0/gson-2.11.0.jar \
    https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.17.1/jackson-core-2.17.1.jar \
    https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.17.1/jackson-databind-2.17.1.jar \
    https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.17.1/jackson-annotations-2.17.1.jar

# ── Apache Commons ──
RUN wget -q -P /usr/share/java/lib/ \
    https://repo1.maven.org/maven2/org/apache/commons/commons-math3/3.6.1/commons-math3-3.6.1.jar \
    https://repo1.maven.org/maven2/org/apache/commons/commons-lang3/3.14.0/commons-lang3-3.14.0.jar \
    https://repo1.maven.org/maven2/commons-io/commons-io/2.16.1/commons-io-2.16.1.jar \
    https://repo1.maven.org/maven2/org/apache/commons/commons-csv/1.11.0/commons-csv-1.11.0.jar \
    https://repo1.maven.org/maven2/org/apache/commons/commons-collections4/4.4/commons-collections4-4.4.jar

# ── Machine Learning (Weka) ──
RUN wget -q -P /usr/share/java/lib/ \
    https://repo1.maven.org/maven2/nz/ac/waikato/cms/weka/weka-stable/3.8.6/weka-stable-3.8.6.jar

# ── Logging ──
RUN wget -q -P /usr/share/java/lib/ \
    https://repo1.maven.org/maven2/org/slf4j/slf4j-api/2.0.13/slf4j-api-2.0.13.jar \
    https://repo1.maven.org/maven2/org/slf4j/slf4j-simple/2.0.13/slf4j-simple-2.0.13.jar

# Clean up wget
RUN apt-get purge -y wget && apt-get autoremove -y

# Create non-root user
RUN groupadd -r runner && useradd -r -g runner -d /sandbox -s /bin/sh runner

# Set up sandbox directory
RUN mkdir -p /sandbox && chown runner:runner /sandbox

WORKDIR /sandbox
USER runner
