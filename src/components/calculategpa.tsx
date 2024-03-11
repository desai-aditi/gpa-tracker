import React, { useState } from 'react';

type Course = {
  name: string;
  grade: number;
  weight: string;
};

const CalculateGPA: React.FC = () => {
  const [gpaScale, setGpaScale] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([{ name: '', grade: 0, weight: 'normal' }]);
  const [gpa, setGpa] = useState<number | null>(null);
  const [currentScreen, setCurrentScreen] = useState('form'); // 'form' or 'result'

  const handleGpaScaleChange = (scale: string) => {
    setGpaScale(scale);
    setCourses([{ name: '', grade: 0, weight: 'normal' }]);
    setGpa(null);
  };

  const handleAddCourse = () => {
    setCourses([...courses, { name: '', grade: 0, weight: 'normal' }]);
  };

  const handleCourseChange = (index: number, field: keyof Course, value: string | number) => {
    const newCourses = [...courses];
    const course = newCourses[index];
    if (field === 'grade') {
      course[field] = typeof value === 'number' ? value : parseFloat(value);
    } else {
      course[field] = value as string;
    }
    setCourses(newCourses);
  };

  const calculateWeightedGPA = () => {
    let totalPoints = 0;
    let totalClasses = courses.length;

    courses.forEach(course => {
      let baseGPA = 0; // Default for F grade
      if (course.grade >= 90) baseGPA = 4.0; // A
      else if (course.grade >= 80) baseGPA = 3.0; // B
      else if (course.grade >= 70) baseGPA = 2.0; // C
      else if (course.grade >= 60) baseGPA = 1.0; // D

      if (course.weight === 'honors') {
        baseGPA += 0.5;
      } else if (course.weight === 'ap') {
        baseGPA += 1.0;
      }

      totalPoints += baseGPA;
    });

    let weightedGPA = totalPoints / totalClasses;
    setGpa(weightedGPA);

    // switch to result screen
    setCurrentScreen('result');
  };

  return (
    <div>

      {currentScreen === 'form' && (
        <div>
            <h2>Calculate GPA</h2>
            <div>
                <button onClick={() => handleGpaScaleChange('unweighted')}>Unweighted</button>
                <button onClick={() => handleGpaScaleChange('weighted')}>Weighted</button>
            </div>
            {gpaScale && (
                <>
                {courses.map((course, index) => (
                    <div key={index}>
                    <input
                        type="text"
                        placeholder="Course Name"
                        value={course.name}
                        onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Grade"
                        value={course.grade}
                        onChange={(e) => handleCourseChange(index, 'grade', e.target.value)}
                    />
                    {gpaScale === 'weighted' && (
                        <select
                        value={course.weight}
                        onChange={(e) => handleCourseChange(index, 'weight', e.target.value)}
                        >
                        <option value="normal">Normal</option>
                        <option value="honors">Honors</option>
                        <option value="ap">AP</option>
                        </select>
                    )}
                    </div>
                ))}
                <button onClick={handleAddCourse}>Add More</button>
                <button onClick={calculateWeightedGPA}>Calculate</button>
                </>
            )}
        </div>
      )}

      {currentScreen === 'result' && (
        <div>
          <h2>Your GPA</h2>
          <p>{gpa !== null ? gpa.toFixed(2) : 'Calculating...'}</p>
          <button onClick={() => setCurrentScreen('form')}>Calculate Again</button>
        </div>
      )}
    </div>
  );
};

export default CalculateGPA;