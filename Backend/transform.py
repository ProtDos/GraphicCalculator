import io
import base64
import random
import matplotlib
matplotlib.use('Agg')
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import r2_score
import json



def get_equations(x_raw, y_raw, id_):
    # sorted_points = sorted([(x, y, (x**2 + y**2)**0.5) for x, y in zip(x_raw, y_raw)], key=lambda point: point[2])

    # Extract sorted x and y values
    # new_x, new_y = zip(*[(x, y) for x, y, _ in sorted_points])

    new_x, new_y = x_raw, y_raw

    x = np.array(new_x)
    y = np.array(new_y)

    plt.clf()
    fig = plt.figure(random.randint(1, 5000), figsize=(11, 8))

    # Create a subplot
    ax = fig.add_subplot(111)

    plt.scatter(x, y, label='Data Points')
    ax.plot(x, y, color='red', label='Connected Line')

    chunk_size = 10

    # Split x and y into chunks of length 5 or less
    x_chunks = [x[i:i + chunk_size] for i in range(0, len(x), chunk_size)]
    y_chunks = [y[i:i + chunk_size] for i in range(0, len(y), chunk_size)]

    eqs = []

    # Print the result
    for i, (x_chunk, y_chunk) in enumerate(zip(x_chunks, y_chunks)):
        # print(f"Chunk {i + 1} - x: {x_chunk}, y: {y_chunk}")

        # Polynomial regression
        degree = 10  # Adjust the degree as needed
        coefficients = np.polyfit(x_chunk, y_chunk, degree)
        poly_equation = np.poly1d(coefficients)

        print(str(poly_equation))

        eqs.append(str(poly_equation))

        y_pred = poly_equation(x_chunk)
        r_squared = r2_score(y_chunk, y_pred)

        # print(f'Accuracy: {round(r_squared * 100, 2)}%')

        # Generate points for the curve
        x_curve = np.linspace(min(x_chunk), max(x_chunk), 100)
        y_curve = poly_equation(x_curve)

        # Plotting the data points and the curve
        random_color = (random.random(), random.random(), random.random())
        ax.plot(x_curve, y_curve, label=f'Polynomial Regression (Degree {degree} | Chunk {i + 1})', color=random_color)

    ax.set_xlim([0, 50])  # Set x-axis limits
    ax.set_ylim([0, 50])  # Set y-axis limits

    plt.grid(True)

    plt.xlabel('x')
    plt.ylabel('y')
    plt.legend()

    image_stream = io.BytesIO()
    plt.savefig(image_stream, format='png', bbox_inches='tight')
    plt.close()

    image_base64 = base64.b64encode(image_stream.getvalue()).decode('utf-8')

    data = {
        "eqs": eqs,
        "image_base64": image_base64
    }

    with open(f"files/{id_}.json", 'w') as file:
        json.dump(data, file, indent=4)

    return True

    # return eqs, image_base64


def get_code(eqs: list):
    all_items = []

    for i, item in enumerate(eqs):
        layout = f"""<span class="dcg-template-expressioneach">
                        <div class="dcg-do-not-blur dcg-expressionitem dcg-mathitem" expr-id="2" index="0">
                            <div class="dcg-fade-container">
                            
                                <div class="dcg-fadeout-left"></div>
                                <div class="dcg-main-container">
                                    <span class="dcg-valign-bar"></span>
                                    <span class="dcg-main">
                                        <span class="dcg-main-content" id="text-{i}">
                                            {item}
                                        </span>
                                    </span>
                                </div>
        
                                <span class="dcg-fadeout"></span>
        
                                <img src="copy.svg" class="dcg-icon-remove dcg-top-level-delete dcg-action-delete" alt="" handleevent="true" height="20px" width="20px" onclick="copy('{i}');">
        
                           
                                <div class="dcg-template-bottom-container dcg-fixed-width-element" style="width: 356px;">
                                    <div class="dcg-template-bottom"></div>
                                </div>
                            </div>
                            
                            <span class="dcg-tab dcg-action-drag dcg-action-icon-touch" handleevent="true" tapboundary="true" disablescroll="true">
                                <span class="dcg-num dcg-variable-index">{i + 1}</span>
        
                            </span>
                            
                        </div>
                    </span>"""
        all_items.append(layout)

    return "\n".join(all_items)
