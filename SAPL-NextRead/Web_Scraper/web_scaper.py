import json
import sys
import requests
from bs4 import BeautifulSoup


data = sys.stdin.readlines()
data = json.loads(data[0])


url = f'https://mysapl.bibliocommons.com/v2/search?searchType=keyword&query=${data[0]}&f_FORMAT=EBOOK%7CBK%7CGRAPHIC_NOVEL%7CLPRINT%7CAB'
response = requests.get(url)
page = BeautifulSoup(response.text, 'html.parser')

results = page.find('ul', class_='results')

print(len(results))
sys.stdout.flush()
