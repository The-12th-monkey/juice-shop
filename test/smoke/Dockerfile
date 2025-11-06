FROM alpine

# Створюємо користувача 'appuser' без привілеїв
RUN adduser -D appuser

# Встановлюємо 'curl', який потрібен для тесту
RUN apk add curl

# Переключаємось на новоствореного користувача
USER appuser

# Копіюємо скрипт і одразу призначаємо 'appuser' його власником
COPY --chown=appuser:appuser smoke-test.sh smoke-test.sh

# Ця команда тепер буде виконуватись від імені 'appuser', а не root
CMD ["sh", "smoke-test.sh", "http://app:3000"]