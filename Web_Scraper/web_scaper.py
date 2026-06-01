import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By

book_title = "Watership Down".replace(" ", "%20")

URL = f"https://mysapl.bibliocommons.com/v2/search?query={book_title}&searchType=title&f_FORMAT=EBOOK%7CBK%7CGRAPHIC_NOVEL%7CLPRINT"
page = requests.get(URL)

soup = BeautifulSoup(page.content, "html.parser")

results = soup.find(class_= "results")
book_links = [e["href"] for e in results.find_all(class_ = "manifestation-item-link")]

for i in book_links:
    book_page
