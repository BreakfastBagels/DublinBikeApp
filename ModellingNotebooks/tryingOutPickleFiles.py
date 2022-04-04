import pickle
from sklearn.preprocessing import PolynomialFeatures

poly = PolynomialFeatures(degree=2)

with open('mean-bikes-pickle4-weekday', 'rb') as file:
    predictor = pickle.load(file)

for i in range(24):
    prediction = predictor.predict(poly.fit_transform(([ [i] ])))
    print(prediction)
