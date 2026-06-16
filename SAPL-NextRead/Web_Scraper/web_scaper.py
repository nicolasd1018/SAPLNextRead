import sys
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


data = sys.argv[1]


# for title in data:
url = f'https://mysapl.bibliocommons.com/v2/search?searchType=keyword&query=${data}&f_FORMAT=EBOOK%7CBK%7CGRAPHIC_NOVEL%7CLPRINT%7CAB'
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
    print(response.content)  # Handle the response
except requests.exceptions.ConnectionError as e:
    print(f"Error connecting to the server: {e}")
except requests.exceptions.HTTPError as e:
    print(f"HTTP error occurred: {e}")
except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")

# response = requests.get(url, {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
page = BeautifulSoup(response.text, 'html.parser')
results = page.find('ul', class_='results')
if results != None:
    results = results.find_all('span', class_= 'title-content')
    results[0].get_text()
    print((data.replace('%20', " "),(any(element.get_text() == data.replace('%20', " ") for element in results))))
else:
    print((data.replace('%20', " "),(False)))
sys.stdout.flush()
