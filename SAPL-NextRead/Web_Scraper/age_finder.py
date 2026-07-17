import sys
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options




data = sys.argv[1]


# for title in data:
url = f'https://mysapl.bibliocommons.com/v2/search?searchType=keyword&query={data}&f_FORMAT=BK%7CAB%7CBOOK_CD%7CEBOOK%7CPAPERBACK%7CGRAPHIC_NOVEL%7CLPRINT%7CPICTURE_BOOK'
session = requests.Session()
retry_strategy = Retry(
    total=5,  # Total number of retries
    backoff_factor=1,  # Waits 1 second between retries, then 2s, 4s, 8s...
    status_forcelist=[429, 500, 502, 503, 504],  # Status codes to retry on
    # method_whitelist=["HEAD", "GET", "OPTIONS"]  # Methods to retry
)

adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("http://", adapter)
session.mount("https://", adapter)

response: requests.Response
try:
    response = session.get(url)
    response.raise_for_status()  # Raise an exception for HTTP errors
except requests.exceptions.ConnectionError as e:
    print(f"Error connecting to the server: {e}")
except requests.exceptions.HTTPError as e:
    print(f"HTTP error occurred: {e}")
except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")

# response = requests.get(url, {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
page = BeautifulSoup(response.text, 'html.parser')
results = page.find('ul', class_='results')
# print(url)
try:
    results = results.find_all('span', class_= 'title-content')
    genre_tags =[element.parent.parent.parent.parent.parent.parent.parent  for element in results if element.get_text().lower() == data.replace('%20', " ").lower() ][0].find_all('span', class_= 'call-number')
    age_rating = [element for element in genre_tags if element.get_text() != ''] 
    if ('juvenile easy' in age_rating[0].get_text().lower() or 'board book' in age_rating[0].get_text().lower()):
        print('Toddler')
    elif ('juvenile beginner' in age_rating[0].get_text().lower()):
        print('Juvenile Beginner')
    elif ('juvenile' in age_rating[0].get_text().lower()):
        print('Juvenile')
    elif ('young adult' in age_rating[0].get_text().lower()):
        print('Young Adult')
    else: 
        print('Adult')
except:
    print('Error Retrieving Age')
sys.stdout.flush()
