from flask import Flask, jsonify, request
from flask_cors import CORS
from transform import get_equations, get_code
import threading
import uuid
import json

app = Flask(__name__)
CORS(app)


def convert(items: list):
    new = []

    for item in items:
        n = item.split("\n")
        needed = [i for i in n if "x" in i]

        nn = " ".join(needed).replace("  ", " ")

        final = []
        x_count = 0
        for ii in nn.split(" ")[::-1]:
            if "e" in ii:
                decimal_notation = "{:.15f}".format(float(ii))

                decimal_notation = decimal_notation.rstrip('0').rstrip('.')

                final.append(decimal_notation)
                pass
            elif "x" not in ii:
                final.append(ii)
            else:
                if x_count == 0:
                    final.append(ii)
                elif x_count == 1:
                    ii = ii.replace("x", "x²")
                    final.append(ii)
                elif x_count == 2:
                    ii = ii.replace("x", "x³")
                    final.append(ii)
                elif x_count == 3:
                    ii = ii.replace("x", "x⁴")
                    final.append(ii)
                elif x_count == 4:
                    ii = ii.replace("x", "x⁵")
                    final.append(ii)
                elif x_count == 5:
                    ii = ii.replace("x", "x⁶")
                    final.append(ii)
                elif x_count == 6:
                    ii = ii.replace("x", "x⁷")
                    final.append(ii)
                elif x_count == 7:
                    ii = ii.replace("x", "x⁸")
                    final.append(ii)
                elif x_count == 8:
                    ii = ii.replace("x", "x⁹")
                    final.append(ii)
                elif x_count == 9:
                    ii = ii.replace("x", "x¹⁰")
                    final.append(ii)
                elif x_count == 10:
                    ii = ii.replace("x", "x¹¹")
                    final.append(ii)
                elif x_count == 11:
                    ii = ii.replace("x", "x¹²")
                    final.append(ii)
                x_count += 1

        new.append(" ".join(final[::-1]))

    return new


@app.route('/get_func', methods=['POST'])
def get_func():
    print("     [i] Got a request.")
    request_data = request.json

    data_points = request_data["dataPoints"]

    x = []
    y = []

    for item in data_points:
        x.append(round(float(item["x"]), 2))
        y.append(round(float(item["y"]), 2))

    print([(xx, y[i]) for i, xx in enumerate(x)])

    id_ = str(uuid.uuid4())

    plot_thread = threading.Thread(target=get_equations, args=(x, y, id_,))
    plot_thread.start()
    plot_thread.join()

    # eqs, encoded_string = get_equations(x, y)

    file_path = f'files/{id_}.json'

    with open(file_path, 'r') as file:
        json_data = json.load(file)

    eqs = json_data["eqs"]
    encoded_string = json_data["image_base64"]

    eqs = convert(eqs)

    cd = get_code(eqs)

    return jsonify({"message": "Success!", "equations": eqs, "cd": cd, "graph_b64": encoded_string})


if __name__ == '__main__':
    app.run(port=80, debug=True)
