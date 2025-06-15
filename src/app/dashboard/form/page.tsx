"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useUserStore } from "@/store/userStore";
import { CircularProgress } from "@/components/progres";
import { CheckCircle, XCircle, BookOpen, Calendar, Users } from "lucide-react";

// Esquema de validación para preselección
const preselectionSchema = z.object({
  courseIds: z.array(z.string()).length(2, "Debe seleccionar exactamente 2 cursos")
});

type PreselectionFormData = z.infer<typeof preselectionSchema>;

interface Course {
  id: string;
  name: string;
  capacity: number;
}

interface CurrentSelection {
  id: string;
  selectionDate: string;
  selectedCourses: Course[];
  student: {
    name: string;
    lastName: string;
  };
}

const PreselectionForm: React.FC = () => {
  const { studentFullDetails } = useUserStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [hasPreselection, setHasPreselection] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<CurrentSelection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PreselectionFormData>({
    resolver: zodResolver(preselectionSchema),
    defaultValues: {
      courseIds: []
    }
  });

  const watchedCourseIds = watch("courseIds");

  // Cargar datos de preselección
  useEffect(() => {
    const fetchPreselectionData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/preselection");
        setCourses(response.data.courses);
        setHasPreselection(response.data.hasPreselection);
        setCurrentSelection(response.data.currentSelection);
        
        // Si ya tiene preselección, cargar los cursos seleccionados
        if (response.data.currentSelection) {
          const selectedIds = response.data.currentSelection.selectedCourses.map((course: Course) => course.id);
          setValue("courseIds", selectedIds);
        }
      } catch (error) {
        console.error("Error al cargar datos de preselección:", error);
        toast.error("Error al cargar los cursos disponibles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreselectionData();
  }, [setValue]);

  const handleCourseToggle = (courseId: string) => {
    const currentIds = watchedCourseIds || [];
    let newIds: string[];

    if (currentIds.includes(courseId)) {
      // Remover curso si ya está seleccionado
      newIds = currentIds.filter(id => id !== courseId);
    } else {
      // Agregar curso si no está seleccionado y hay espacio
      if (currentIds.length < 2) {
        newIds = [...currentIds, courseId];
      } else {
        toast.error("Solo puedes seleccionar 2 cursos");
        return;
      }
    }

    setValue("courseIds", newIds);
  };

  const onSubmit = async (data: PreselectionFormData) => {
    try {
      setIsSubmitting(true);

      const method = hasPreselection ? 'PUT' : 'POST';
      const response = await axios({
        method,
        url: "/api/preselection",
        data: { courseIds: data.courseIds }
      });

      toast.success(hasPreselection ? 
        "¡Preselección actualizada exitosamente!" : 
        "¡Preselección registrada exitosamente!"
      );
      
      // Recargar datos para actualizar el estado
      const updatedResponse = await axios.get("/api/preselection");
      setCourses(updatedResponse.data.courses);
      setHasPreselection(updatedResponse.data.hasPreselection);
      setCurrentSelection(updatedResponse.data.currentSelection);

    } catch (error) {
      console.error("Error al procesar preselección:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || "Error al procesar la preselección");
      } else {
        toast.error("Error inesperado al procesar la preselección");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!studentFullDetails && !isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-center text-gray-600">
        <p>
          No se encontraron detalles de estudiante. Por favor, asegúrate de que
          tu perfil de estudiante esté creado.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
        <p className="ml-3 text-gray-700">Cargando cursos de verano...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
      <div className="flex items-center mb-6">
        <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
        <h2 className="text-3xl font-bold text-gray-800">
          Preselección de Cursos de Verano
        </h2>
      </div>

      {/* Estado actual de preselección */}
      {hasPreselection && currentSelection && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-green-800">
              Preselección Registrada
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Fecha: {new Date(currentSelection.selectionDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-green-700">
                <Users className="inline h-4 w-4 mr-1" />
                Estudiante: {currentSelection.student.name} {currentSelection.student.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 mb-2">Cursos seleccionados:</p>
              <ul className="text-sm text-green-700 space-y-1">
                {currentSelection.selectedCourses.map((course) => (
                  <li key={course.id} className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    {course.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          Selecciona exactamente 2 cursos para tu preselección de verano. 
          {hasPreselection ? " Puedes modificar tu selección actual." : ""}
        </p>
        
        {/* Contador de selecciones */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              Cursos seleccionados: {watchedCourseIds?.length || 0} / 2
            </span>
            <div className="flex space-x-2">
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full ${
                    (watchedCourseIds?.length || 0) > index
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de selección */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Lista de cursos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Cursos Disponibles
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => {
              const isSelected = watchedCourseIds?.includes(course.id) || false;
              return (
                <div
                  key={course.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => handleCourseToggle(course.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {course.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Capacidad: {course.capacity} estudiantes
                      </p>
                    </div>
                    <div className="ml-3">
                      {isSelected ? (
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      ) : (
                        <div className="h-6 w-6 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    {...register("courseIds")}
                    value={course.id}
                    checked={isSelected}
                    onChange={() => {}} // Manejado por onClick del div
                    className="hidden"
                  />
                </div>
              );
            })}
          </div>
          {errors.courseIds && (
            <p className="mt-2 text-sm text-red-600">{errors.courseIds.message}</p>
          )}
        </div>

        {/* Botón de envío */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || (watchedCourseIds?.length || 0) !== 2}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              isSubmitting || (watchedCourseIds?.length || 0) !== 2
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <CircularProgress />
                <span className="ml-2">
                  {hasPreselection ? "Actualizando..." : "Registrando..."}
                </span>
              </div>
            ) : (
              hasPreselection ? "Actualizar Preselección" : "Registrar Preselección"
            )}
          </button>
        </div>
      </form>

      {/* Información adicional */}
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Información Importante:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Debes seleccionar exactamente 2 cursos para tu preselección</li>
          <li>• Puedes modificar tu selección hasta la fecha límite</li>
          <li>• La preselección no garantiza tu inscripción final</li>
          <li>• Los cupos se asignarán según disponibilidad y criterios académicos</li>
          <li>• Mantente atento a las comunicaciones oficiales sobre el proceso</li>
        </ul>
      </div>
    </div>
  );
};

export default PreselectionForm;
