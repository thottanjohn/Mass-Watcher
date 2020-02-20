Steps:-
conda create --name myenv python=3.7
conda activate myenv
conda install -c conda-forge opencv
conda install tensorflow-gpu==1.15
pip install keras 
conda install matplotlib
conda install pandas
conda install -c conda-forge imageio

pip install cmake
pip install dlib
pip install face_recognition

Run the file by going to root folder
python  FINAL/src/main.py
python people_count/people_count.py
