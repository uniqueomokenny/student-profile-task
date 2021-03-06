import React, { useEffect, useState, useCallback } from 'react';

import { StyledApp, ContentsWrapper, ProfileWrapper } from './app.styled';

import CustomInput from '../custom-unput/custom-input.comp';
import Profiles from '../profiles/profiles.comp';

function App() {
	const [loading, setLoading] = useState(false);
	const [students, setStudents] = useState([]);
	const [searchedStudents, setSearchedStudents] = useState([]);

	const [name, setName] = useState('');
	const [tag, setTag] = useState('');

	const saveStudents = (students) =>
		localStorage.setItem('students', JSON.stringify(students));

	const getStudents = () => JSON.parse(localStorage.getItem('students'));

	const fetchStudents = useCallback(() => {
		setLoading(true);
		fetch('https://www.hatchways.io/api/assessment/students')
			.then((res) => res.json())
			.then((data) => {
				setLoading(false);
				const allStudents = data.students.map((student) => {
					return { ...student, tags: [] };
				});
				setStudents(allStudents);

				saveStudents(allStudents);
			})
			.catch((err) => {
				setLoading(false);
				console.log(err);
			});
	}, []);

	useEffect(() => {
		if (!localStorage.students) {
			fetchStudents();
		} else setStudents(getStudents());
	}, [fetchStudents]);

	const filterStudents = (tag, name) => {
		let allStudents = students;

		tag !== '' &&
			(allStudents = students.filter((s) => {
				const tags = s.tags.join(',');
				return tags.includes(tag);
			}));

		name !== '' &&
			(allStudents = allStudents.filter((s) => {
				const names = `${s.firstName} ${s.lastName}`.toLowerCase();

				return names.includes(name.toLowerCase());
			}));

		setSearchedStudents(allStudents);
	};

	const onTagChange = (e) => {
		const tag = e.target.value;
		setTag(tag);
		filterStudents(tag, name);
	};

	const onNameChange = (e) => {
		const name = e.target.value;
		setName(name);
		filterStudents(tag, name);
	};

	const setStudentTag = (tag, studentId) => {
		const studentIndex = students.findIndex((s) => s.id === studentId);

		const student = students.filter((s) => s.id === studentId)[0];

		student.tags = [...student.tags, tag];

		students[studentIndex] = student;

		saveStudents(students);

		setStudents(students);
	};

	return (
		<StyledApp>
			<div className='container'>
				<ContentsWrapper>
					<div className='inputs-container'>
						<CustomInput
							placeholder='Search by name'
							value={name}
							onChange={onNameChange}
						/>

						<CustomInput
							placeholder='Search by tags'
							value={tag}
							onChange={onTagChange}
						/>
					</div>

					<ProfileWrapper>
						{students && !loading && (
							<Profiles
								students={students}
								searchedStudents={searchedStudents}
								setStudentTag={setStudentTag}
								tag={tag}
								name={name}
							/>
						)}
					</ProfileWrapper>
				</ContentsWrapper>
			</div>
		</StyledApp>
	);
}

export default App;
