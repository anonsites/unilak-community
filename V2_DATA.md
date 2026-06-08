
information

faq_table
-------
id
topic
question
answer
category
keywords
order
is_published
created_by
created_at
updated_at
view_count

survey_table
-------
id
user_id (FK to profiles_table, nullable)
course_id (FK to classes_table)
course_name (denormalized)
faculty
intake
department
program
cp_contact
whatsapp_link



classes_table
-------
id
course_name
faculty (CIS/ESM/Law/Education/Environmental studies)
department
program (day/weekend/evening) only
academic_year(2020/2021/2022/2023/2024/2025/2026/2027) and so on....
yearOfStudy(1/2/3) only
intake(Jan + academic_year, Summer + academic_year and Sept + academic_year) only
lecturer
start_date
end_date
cat_date
exam_date
classroom
whatsapp_link
cp_contact (class representative phone number)
last_updated
status


----
