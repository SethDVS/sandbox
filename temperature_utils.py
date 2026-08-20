"""Small temperature conversion helpers, used to exercise the @claude PR workflow."""


def celsius_to_fahrenheit(celsius):
    return celsius * 9 / 5 + 32


def fahrenheit_to_celsius(fahrenheit):
    return (fahrenheit - 32) * 5 / 9


def classify_temperature(celsius):
    if celsius < 0:
        return "freezing"
    elif celsius < 15:
        return "cold"
    elif celsius < 25:
        return "mild"
    else:
        return "hot"


if __name__ == "__main__":
    for temp in [-5, 10, 20, 30]:
        print(f"{temp}C = {celsius_to_fahrenheit(temp)}F ({classify_temperature(temp)})")
