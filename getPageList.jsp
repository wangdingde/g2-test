
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@page import="java.io.PrintWriter"%>
<%@page import="java.io.File"%>
<%@page import="java.io.FileWriter"%>
<%@page import="java.util.*"%>
<%@page import="com.google.gson.Gson"%>
<%
	PrintWriter writer = response.getWriter();
	Gson g = new Gson();
	//ml
	String sourceFileName = session.getServletContext().getRealPath("/")+"source/";
	File f = new File(sourceFileName);
	
	if (!f.exists()){
		f.mkdirs();
	}
	
	File[] flist = f.listFiles();
	int i = 0;
	int len = flist.length;
	List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();
	Map<String, Object> m = null;
	String name = null;
	
	for (; i < len; i++) {
		f = flist[i];
		name = f.getName();
		m = new HashMap<String, Object>();
		m.put("no", "source/"+name);
		m.put("name", name.substring(0, name.lastIndexOf(".")));
		
		data.add(m);
	}
	
	writer.write(g.toJson(data));
	writer.flush();
	writer.close();
%>